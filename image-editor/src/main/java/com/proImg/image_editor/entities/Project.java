package com.proImg.image_editor.entities;

import javax.persistence.*;

import com.proImg.image_editor.state.ClosedDownloadableState;
import com.proImg.image_editor.state.ClosedState;
import com.proImg.image_editor.state.EditableState;
import com.proImg.image_editor.state.ProjectState;
import lombok.*;

import java.util.List;

@Entity
@Data
@Table(name = "projects")
@AllArgsConstructor
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Boolean editingEnabled;
    private Boolean downloadEnabled;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Collage> collages;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members;

    @Transient
    private ProjectState state;

    public void setState() {
        if (Boolean.TRUE.equals(editingEnabled) && Boolean.TRUE.equals(downloadEnabled)) {
            this.state = new EditableState();
        } else if (Boolean.FALSE.equals(editingEnabled) && Boolean.TRUE.equals(downloadEnabled)) {
            this.state = new ClosedDownloadableState();
        } else if (Boolean.FALSE.equals(editingEnabled) && Boolean.FALSE.equals(downloadEnabled)) {
            this.state = new ClosedState();
        } else {
            throw new IllegalStateException("Invalid project state configuration");
        }
    }

}

