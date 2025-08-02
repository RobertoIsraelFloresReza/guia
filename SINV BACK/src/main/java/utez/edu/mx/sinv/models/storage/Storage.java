package utez.edu.mx.sinv.models.storage;

import jakarta.persistence.*;
import lombok.*;
import utez.edu.mx.sinv.models.articles.Articles;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.user.Users;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "storages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Storage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identifier", length = 10, nullable = false, unique = true)
    private String identifier; // Ej: A-001

    @Column(columnDefinition = "BOOL DEFAULT true")
    private Boolean status = true;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Categories category;

    @OneToOne
    @JoinColumn(name = "responsible_id", unique = true)
    private Users responsible;

    @ManyToMany(mappedBy = "storages")
    private Set<Articles> articles = new HashSet<>();

    // Metodo helper para mantener consistencia en ambas direcciones
    public void addArticle(Articles article) {
        this.articles.add(article);
        article.getStorages().add(this);
    }

    public void removeArticle(Articles article) {
        this.articles.remove(article);
        article.getStorages().remove(this);
    }
}