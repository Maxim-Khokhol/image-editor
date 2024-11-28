package com.proImg.image_editor.entities;

import javax.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@Table(name = "collages")
@AllArgsConstructor
@NoArgsConstructor
public class Collage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String backgroundColor;

    private int gridGap;
    private int gridX;
    private int gridY;
    private int width;
    private int height;
    private int padding;

    @Column(name = "`left`")
    private int left;

    @Column(name = "`top`")
    private int top;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "collage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cell> cells;


}
