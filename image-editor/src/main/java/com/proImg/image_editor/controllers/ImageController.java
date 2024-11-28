//// Backend
//// ProjectState.java
//package com.proImg.image_editor.entities;
//
//public interface ProjectState {
//    void state(Project project);
//}
//
//// ClosedState.java
//package com.proImg.image_editor.entities;
//
//public class ClosedState implements ProjectState {
//    @Override
//    public void state(Project project) {
//        System.out.println("Project is in Closed state. Viewing only allowed.");
//        project.setEditingEnabled(false);
//        project.setDownloadEnabled(false);
//    }
//}
//
//// ClosedDownloadableState.java
//package com.proImg.image_editor.entities;
//
//public class ClosedDownloadableState implements ProjectState {
//    @Override
//    public void state(Project project) {
//        System.out.println("Project is in Closed-Downloadable state. Viewing and downloading allowed.");
//        project.setEditingEnabled(false);
//        project.setDownloadEnabled(true);
//    }
//}
//
//// EditableState.java
//package com.proImg.image_editor.entities;
//
//public class EditableState implements ProjectState {
//    @Override
//    public void state(Project project) {
//        System.out.println("Project is in Editable state. Editing allowed.");
//        project.setEditingEnabled(true);
//        project.setDownloadEnabled(true);
//    }
//}
//
//// Project.java
//package com.proImg.image_editor.entities;
//
//        import lombok.Getter;
//        import lombok.Setter;
//        import javax.persistence.*;
//        import java.util.List;
//
//@Entity
//@Table(name = "projects")
//@Getter
//@Setter
//public class Project {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    private String name;
//    private boolean isEditingEnabled;
//    private boolean isDownloadEnabled;
//
//    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Collage> collages;
//
//    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Image> images;
//
//    @ManyToOne
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;
//
//    @Transient
//    private ProjectState state;
//
//    public void setState(ProjectState state) {
//        this.state = state;
//        this.state.state(this);
//    }
//}
//
//// ProjectService.java
//package com.proImg.image_editor.service;
//
//        import com.proImg.image_editor.entities.*;
//        import com.proImg.image_editor.repositories.ProjectRepository;
//        import org.springframework.beans.factory.annotation.Autowired;
//        import org.springframework.stereotype.Service;
//        import org.springframework.web.multipart.MultipartFile;
//
//        import java.io.IOException;
//        import java.util.ArrayList;
//        import java.util.List;
//        import java.util.Optional;
//        import java.util.stream.Collectors;
//        import java.util.stream.StreamSupport;
//
//@Service
//public class ProjectService {
//    private final ProjectRepository projectRepository;
//
//    @Autowired
//    public ProjectService(ProjectRepository projectRepository) {
//        this.projectRepository = projectRepository;
//    }
//
//    public Project createProjectWithName(String name) {
//        Project project = new Project();
//        project.setName(name);
//        project.setState(new ClosedState()); // Set initial state as Closed
//        return projectRepository.save(project);
//    }
//
//    public Optional<Project> getProjectById(Long id) {
//        return projectRepository.findById(id);
//    }
//
//    public Project updateProjectState(Long projectId, String state) {
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new RuntimeException("Project not found"));
//
//        switch (state.toLowerCase()) {
//            case "editable":
//                project.setState(new EditableState());
//                break;
//            case "closed-downloadable":
//                project.setState(new ClosedDownloadableState());
//                break;
//            default:
//                project.setState(new ClosedState());
//        }
//
//        return projectRepository.save(project);
//    }
//
//    public List<Project> getAllProjects() {
//        return StreamSupport.stream(projectRepository.findAll().spliterator(), false)
//                .collect(Collectors.toList());
//    }
//}
//
//// StateController.java
//package com.proImg.image_editor.controllers;
//
//        import com.proImg.image_editor.entities.Project;
//        import com.proImg.image_editor.service.ProjectService;
//        import lombok.RequiredArgsConstructor;
//        import org.springframework.http.ResponseEntity;
//        import org.springframework.web.bind.annotation.*;
//
//        import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/projects")
//@RequiredArgsConstructor
//public class StateController {
//    private final ProjectService projectService;
//
//    @PostMapping("/{projectId}/state")
//    public ResponseEntity<?> setProjectState(@PathVariable Long projectId, @RequestParam String state) {
//        try {
//            Project updatedProject = projectService.updateProjectState(projectId, state);
//            return ResponseEntity.ok("State changed to: " + state);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    @GetMapping("/{projectId}/state")
//    public ResponseEntity<?> getProjectState(@PathVariable Long projectId) {
//        Optional<Project> project = projectService.getProjectById(projectId);
//        if (project.isPresent()) {
//            return ResponseEntity.ok("Current state: " + project.get().getState().getClass().getSimpleName());
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
//
//// ProjectRepository.java
//package com.proImg.image_editor.repositories;
//
//        import com.proImg.image_editor.entities.Project;
//        import org.springframework.data.repository.CrudRepository;
//        import org.springframework.stereotype.Repository;
//
//@Repository
//public interface ProjectRepository extends CrudRepository<Project, Long> {
//}
