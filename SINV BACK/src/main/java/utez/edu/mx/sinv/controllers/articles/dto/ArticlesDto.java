package utez.edu.mx.sinv.controllers.articles.dto;

import lombok.*;
import utez.edu.mx.sinv.models.articles.Articles;
import utez.edu.mx.sinv.models.categories.Categories;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ArticlesDto {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private Set<Long> storageIds = new HashSet<>(); // Cambiado a Set para muchos a muchos
    private Boolean status;

    public Articles toEntity() {
        Articles article = new Articles();
        article.setId(this.id);
        article.setName(this.name);
        article.setDescription(this.description);
        article.setStatus(this.status != null ? this.status : true);

        if (this.categoryId != null) {
            Categories category = new Categories();
            category.setId(this.categoryId);
            article.setCategory(category);
        }

        // No establecemos las relaciones Storage aquí, se manejarán en el servicio
        return article;
    }

    public static ArticlesDto fromEntity(Articles article) {
        ArticlesDto dto = new ArticlesDto();
        dto.setId(article.getId());
        dto.setName(article.getName());
        dto.setDescription(article.getDescription());
        dto.setStatus(article.getStatus());

        if (article.getCategory() != null) {
            dto.setCategoryId(article.getCategory().getId());
        }

        // Obtenemos todos los IDs de los almacenes relacionados
        if (article.getStorages() != null) {
            dto.setStorageIds(article.getStorages().stream()
                    .map(storage -> storage.getId())
                    .collect(Collectors.toSet()));
        }

        return dto;
    }
}