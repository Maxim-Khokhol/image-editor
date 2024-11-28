package com.proImg.image_editor.service;

import com.proImg.image_editor.entities.Image;
import com.proImg.image_editor.entities.Project;
import com.proImg.image_editor.repositories.ProjectRepository;
import com.proImg.image_editor.state.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final AnnouncementService announcementService;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, AnnouncementService announcementService) {
        this.projectRepository = projectRepository;
        this.announcementService = announcementService;
    }

    public Project createProjectWithName(String name) {
        Project project = new Project();
        project.setName(name);
        project.setEditingEnabled(true);
        project.setDownloadEnabled(true);
        project.setState();
        project.getState().state(project, announcementService);
        return projectRepository.save(project);
    }


    public Optional<Project> getProjectById(Long id) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        optionalProject.ifPresent(Project::setState);
        return optionalProject;
    }

    public Project updateProjectState(Long projectId, ProjectStateType stateType) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        switch (stateType) {
            case CLOSED:
                project.setState(new ClosedState());
                break;
            case CLOSED_DOWNLOADABLE:
                project.setState(new ClosedDownloadableState());
                break;
            default:
                project.setState(new EditableState());
        }

        project.getState().state(project, announcementService);

        return projectRepository.save(project);
    }


    public List<Project> getAllProjects() {
        return StreamSupport.stream(projectRepository.findAll().spliterator(), false)
                .peek(Project::setState)
                .collect(Collectors.toList());
    }

    public Project saveProjectWithDetails(Project project, MultipartFile[] files) throws IOException {
        List<Image> images = new ArrayList<>();

        for (MultipartFile file : files) {
            Image image = new Image(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes(),
                    project
            );
            images.add(image);
        }

        project.setImages(images);
        return projectRepository.save(project);
    }
}