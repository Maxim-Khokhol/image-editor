package com.proImg.image_editor.service;

import com.proImg.image_editor.entities.Announcement;
import com.proImg.image_editor.entities.Project;
import com.proImg.image_editor.entities.User;
import com.proImg.image_editor.repositories.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    @Autowired
    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public void createAnnouncement(Project project, String message) {
        Announcement announcement = createAnnouncementForUser(project, project.getUser(), message);
        announcementRepository.save(announcement);

        project.getMembers().forEach(member -> {
            Announcement memberAnnouncement = createAnnouncementForUser(project, member, message);
            announcementRepository.save(memberAnnouncement);
        });
    }

    private Announcement createAnnouncementForUser(Project project, User user, String message) {
        Announcement announcement = new Announcement();
        announcement.setProjectOwnerUsername(project.getUser().getUsername());
        announcement.setProjectName(project.getName());
        announcement.setDate(new Date());
        announcement.setMessage(message);
        announcement.setUser(user);
        return announcement;
    }
}