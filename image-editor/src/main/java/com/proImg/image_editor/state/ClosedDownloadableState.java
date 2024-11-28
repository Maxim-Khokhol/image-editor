package com.proImg.image_editor.state;

import com.proImg.image_editor.entities.Project;
import com.proImg.image_editor.service.AnnouncementService;

public class ClosedDownloadableState implements ProjectState {

    @Override
    public void state(Project project, AnnouncementService announcementService) {
        String message = String.format("Project '%s' by owner '%s' is in 'Closed - images available for download' state." +
                        " Only image downloads are allowed.",
                project.getName(), project.getUser().getUsername());

        announcementService.createAnnouncement(project, message);

        project.setEditingEnabled(false);
        project.setDownloadEnabled(true);
    }
}

