package utez.edu.mx.sinv.controllers.articles.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StorageSimpleDto {
    private Long id;
    private String identifier;
    private Boolean status;
}