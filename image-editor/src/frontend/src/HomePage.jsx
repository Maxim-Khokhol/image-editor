import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css"

export function HomePage() {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('/api/projects');
                setProjects(response.data);
            } catch (error) {
                console.error("Error loading projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const createProject = async () => {
        try {
            const response = await axios.post('/api/createProject', { name: newProjectName });
            const projectId = response.data.id;

            navigate(`/project/${projectId}`, { state: { projectName: newProjectName } });
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const handleCreateButtonClick = () => {
        setShowModal(true);
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        setShowModal(false);
        createProject();
    };

    return (
        <div>
            <h1>Your projects</h1>
            <button onClick={handleCreateButtonClick}>Create a new project</button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create a new project</h2>
                        <form onSubmit={handleModalSubmit}>
                            <label>
                                Project name:
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    required
                                />
                            </label>
                            <button type="submit">Create</button>
                            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <div>
                {projects.length > 0 ? (
                    <ul>
                        {projects.map(project => (
                            <li key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
                                {project.name || `Project #${project.id}`}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>There are no projects.</p>
                )}
            </div>
        </div>
    );
}


