package com.proImg.image_editor.repositories;

import com.proImg.image_editor.entities.Collage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollageRepository extends CrudRepository<Collage, Long> {
}
