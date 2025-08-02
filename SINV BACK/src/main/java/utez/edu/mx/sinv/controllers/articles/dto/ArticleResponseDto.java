package utez.edu.mx.sinv.controllers.articles.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class ArticleResponseDto {
    private Long id;
    private String name;
    private String description;
    private Boolean status;
    private CategorySimpleDto category;
    private Set<StorageSimpleDto> storages;
}