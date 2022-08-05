import Project from '../models/Project.js';
import User from '../models/User.js';

export const getProjects = async(req, res) => {
    const projects = await Project.find({'$or' : [
        {'collaborators': {$in: req.user}},
        {'creator': {$in: req.user}},
    ]}).select('-tasks');
    res.json(projects)
}

export const newProject = async(req, res) => {
    const project = new Project(req.body)
    project.creator = req.user._id
    try {
        const saveProject = await project.save();
        res.json(saveProject)
    } catch (error) {
        console.log(error)
    }
}

export const getProject = async(req, res) => {
    const { id } = req.params;

    if(id.length !== 24){
        const error = new Error('Invalid ID')
        return res.status(404).json({ msg: error.message })
    }

    const findproject = await Project.findById(id)
                                    .populate({path: 'tasks', populate:{path: 'completed', select: 'name'} })
                                    .populate('collaborators', 'name email');
    if (!findproject){
        const error = new Error('Project not found')
        return res.status(404).json({ msg: error.message })
    }

    if(findproject.creator.toString() !== req.user._id.toString() && !findproject.collaborators.some(collab => collab._id.toString() === req.user._id.toString())){
        const error = new Error('Unauthorized');
        return res.status(401).json({ msg: error.message });
    }

    res.status(200).json(findproject);
}

export const editProject = async(req, res) => {
    const {id} = req.params;

    if(id.length !== 24){
        const error = new Error('Invalid ID')
        return res.status(404).json({ msg: error.message })
    }

    const project = await Project.findById(id)

    if (!project){
        const error = new Error('Project not found')
        return res.status(404).json({ msg: error.message})
    }

    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error('Unauthorized')
        return res.status(401).json({ msg: error.message})
    }

    project.name = req.body.name || project.name
    project.description = req.body.description || project.description
    project.deliveryDate = req.body.deliveryDate || project.deliveryDate
    project.client = req.body.client || project.client

    try {
        const saveProject = await project.save();
        res.json (saveProject)
    } catch (error) {
        console.log(error)
    }
}

export const deleteProject = async(req, res) => {
    const {id} = req.params;

    if(id.length !== 24){
        const error = new Error('Invalid ID')
        return res.status(404).json({ msg: error.message })
    }

    const project = await Project.findById(id)

    if (!project){
        const error = new Error('Project not found')
        return res.status(404).json({ msg: error.message})
    }

    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error('Unauthorized')
        return res.status(401).json({ msg: error.message})
    }

    try {
        await project.deleteOne();
        return res.json ({msg: 'project deleted successfully'})
    } catch (error) {
        console.log(error)
    }  
}

export const searchCollaborators = async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email: email}).select('-confirmed -password -createdAt -updatedAt -token -__v');
    if (!user){
        const error = new Error ('User not found!')
        return res.status(404).json({ msg: error.message })
    }

    return res.status(200).json(user);

}

export const addCollaborator = async(req, res) => {
    const project = await Project.findById(req.params.id);

    const {email} = req.body;

    if (!project){
        const error = new Error ('Project not found!');
        return res.status(404).json({ msg: error.message })
    }

    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized!');
        return res.status(404).json({ msg: error.message })
    }

    const user = await User.findOne({email}).select('-confirmed -password -createdAt -updatedAt -token -__v');

    if (!user){
        const error = new Error ('User not found!')
        return res.status(404).json({ msg: error.message })
    }

    if(project.creator.toString() === user._id.toString()){
        const error = new Error ('Invalid action!')
        return res.status(404).json({ msg: error.message })
    }

    if(project.collaborators.includes(user._id)){
        const error = new Error ('User already exists');
        return res.status(404).json({ msg: error.message });
    }
    
    project.collaborators.push(user._id);
    await project.save();
    res.status(200).json({msg:'Collaborator added successfully'});
};

export const deleteCollaborator = async(req, res) => {
    const project = await Project.findById(req.params.id);

    const { id } = req.body;

    if (!project){
        const error = new Error ('Project not found!');
        return res.status(404).json({ msg: error.message })
    }

    if(project.creator.toString() !== req.user._id.toString()){
        const error = new Error ('Unauthorized!');
        return res.status(404).json({ msg: error.message })
    }

    project.collaborators.pull(id);
    await project.save();
    res.status(200).json({msg:'Collaborator deleted successfully'});
};
