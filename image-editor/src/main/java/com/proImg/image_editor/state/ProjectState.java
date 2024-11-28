package com.proImg.image_editor.state;



import com.proImg.image_editor.entities.Project;
import com.proImg.image_editor.service.AnnouncementService;


public interface ProjectState {

    void state(Project project, AnnouncementService announcementService);
}

