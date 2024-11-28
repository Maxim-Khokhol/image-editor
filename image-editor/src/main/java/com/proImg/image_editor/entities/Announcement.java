package com.proImg.image_editor.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Entity
@Data
@Table(name = "announcements")
@AllArgsConstructor
@NoArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectOwnerUsername;

    private String projectName;

    private Date date;

    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
