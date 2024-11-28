package com.proImg.image_editor.entities;

import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;

    @Column(name = "email", unique = true)
    private String email;

    private String password;

    @OneToMany(mappedBy = "user")
    private List<Project> ownedProjects;

    @ManyToMany(mappedBy = "members")
    private List<Project> projects;

    @OneToMany(mappedBy = "user")
    private List<Announcement> announcements;

}

