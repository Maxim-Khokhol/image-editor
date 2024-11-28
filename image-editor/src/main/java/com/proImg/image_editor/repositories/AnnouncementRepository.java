package com.proImg.image_editor.repositories;

import com.proImg.image_editor.entities.Announcement;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends CrudRepository<Announcement, Long> {
}
