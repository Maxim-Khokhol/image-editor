package com.proImg.image_editor.state;

import com.proImg.image_editor.entities.Project;
import com.proImg.image_editor.service.AnnouncementService;

public class EditableState implements ProjectState {

    @Override
    public void state(Project project, AnnouncementService announcementService) {
        String message = String.format("Project '%s' by owner '%s' is in 'Editable' state. " +
                        "Editing of the project and downloading of images are allowed.",
                project.getName(), project.getUser().getUsername());

        announcementService.createAnnouncement(project, message);

        project.setEditingEnabled(true);
        project.setDownloadEnabled(true);
    }
}

