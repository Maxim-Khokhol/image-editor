package com.proImg.image_editor.entities;
import javax.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String type;

    private int width;
    private int height;

    private int indexInCollage;

    private Long collageId;


    @Column(name = "`left`")
    private int left;

    @Column(name = "`top`")
    private int top;

    @Lob
    @Column(length = 50000000)
    private byte[] picByte;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;



    public Image(String name, String type, byte[] picByte, Project project) {
        this.name = name;
        this.type = type;
        this.picByte = picByte;
        this.project = project;
    }

    public Image(String name, String type, byte[] picByte) {
        this.name = name;
        this.type = type;
        this.picByte = picByte;
    }
}
