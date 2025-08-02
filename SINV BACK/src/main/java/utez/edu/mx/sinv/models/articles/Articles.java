package utez.edu.mx.sinv.models.articles;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.storage.Storage;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Articles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 500, nullable = false)
    private String description;

    @Column(columnDefinition = "BOOL DEFAULT true")
    private Boolean status = true;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Categories category;

    @ManyToMany
    @JsonIgnore
    @JoinTable(
            name = "storage_has_articles",
            joinColumns = @JoinColumn(name = "article_id"),
            inverseJoinColumns = @JoinColumn(name = "storage_id")
    )
    private Set<Storage> storages = new HashSet<>();
}