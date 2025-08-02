package utez.edu.mx.sinv.controllers.storage.dto;

import lombok.*;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.storage.Storage;
import utez.edu.mx.sinv.models.user.Users;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StorageDto {
    private Long id;
    private String identifier;
    private Long categoryId;
    private Long responsibleId;
    private Boolean status;

    public Storage toEntity() {
        Storage storage = new Storage();
        storage.setId(this.id);
        storage.setIdentifier(this.identifier);
        storage.setStatus(this.status != null ? this.status : true);

        if (this.categoryId != null) {
            Categories category = new Categories();
            category.setId(this.categoryId);
            storage.setCategory(category);
        }

        if (this.responsibleId != null) {
            Users responsible = new Users();
            responsible.setId(this.responsibleId);
            storage.setResponsible(responsible);
        }

        return storage;
    }

    public static StorageDto fromEntity(Storage storage) {
        StorageDto dto = new StorageDto();
        dto.setId(storage.getId());
        dto.setIdentifier(storage.getIdentifier());
        dto.setStatus(storage.getStatus());

        if (storage.getCategory() != null) {
            dto.setCategoryId(storage.getCategory().getId());
        }

        if (storage.getResponsible() != null) {
            dto.setResponsibleId(storage.getResponsible().getId());
        }

        return dto;
    }
}