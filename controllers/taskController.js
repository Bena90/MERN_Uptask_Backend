import Task from '../models/Task.js';
import Project from '../models/Project.js'

export const addTask = async (req, res) =>{
    const { project } = req.body;

    const checkProject = await Project.findById(project)

    if(!checkProject){
        const error = new Error(`Project not found`);
        return res.status(404).json(error.message);
    }
    
    if(checkProject.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized');
        return res.status(401).json(error.message);
    }

    try {
        const saveTask = await Task.create(req.body);
        checkProject.tasks.push(saveTask._id);
        await checkProject.save();
        res.json(saveTask)
    } catch (error) {
        console.log(error)
    }
}

export const getTask = async (req, res) =>{
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');

    if(!task){
        const error = new Error('Task not found');
        return res.status(404).json(error.message)
    }

    if(task.project.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized');
        return res.status(401).json(error.message);
    }

    try {
        res.json(task)
    } catch (error) {
        console.log(error)
    }

}

export const updateTask = async (req, res) =>{
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');

    if(!task){
        const error = new Error('Task not found');
        return res.status(404).json(error.message)
    }

    if(task.project.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized');
        return res.status(401).json(error.message);
    }

    task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.deliveryDate = req.body.deliveryDate || task.deliveryDate;

    try {
        const saveTask = await task.save()
        res.json(saveTask)
    } catch (error) {
        console.log(error)
    }
}

export const deleteTask = async (req, res) =>{
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');

    if(!task){
        const error = new Error('Task not found');
        return res.status(404).json(error.message)
    }

    if(task.project.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized');
        return res.status(401).json(error.message);
    }

    try {
        const project = await Project.findById(task.project)
        project.tasks.pull(task._id);
        await Promise.allSettled([
            await project.save(),
            await task.deleteOne()
        ]);
        res.json ({msg: 'Task deleted successfully'})
    } catch (error) {
        console.log(error);
    }
}

export const updateStateTask = async (req, res) =>{
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');
    if(!task){
        const error = new Error('Task not found');
        return res.status(404).json(error.message)
    }
    if(task.project.creator.toString() !== req.user._id.toString() && !task.project.collaborators.some(collab => collab._id.toString() === req.user._id.toString())){
        const error = new Error ('Unauthorized');
        return res.status(401).json(error.message);
    }

    task.state = !task.state
    task.completed = req.user._id;
    await task.save();
    
    const taskSaved = await Task.findById(id).populate('project').populate('completed');

    res.json(taskSaved);
}