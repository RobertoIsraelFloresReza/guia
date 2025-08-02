package utez.edu.mx.sinv.controllers.categories.dto;

import lombok.*;
import utez.edu.mx.sinv.models.categories.Categories;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoriesDto {
    private Long id;
    private String name;
    private Boolean status;

    public Categories toEntity() {
        Categories category = new Categories();
        category.setId(this.id);
        category.setName(this.name);
        category.setStatus(this.status != null ? this.status : true);
        return category;
    }

    public static CategoriesDto fromEntity(Categories category) {
        CategoriesDto dto = new CategoriesDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setStatus(category.getStatus());
        return dto;
    }
}