package utez.edu.mx.sinv.controllers.articles.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategorySimpleDto {
    private Long id;
    private String name;
    private Boolean status;
}