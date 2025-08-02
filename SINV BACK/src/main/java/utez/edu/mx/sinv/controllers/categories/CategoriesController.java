package utez.edu.mx.sinv.controllers.categories;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.categories.dto.CategoriesDto;
import utez.edu.mx.sinv.services.categories.CategoriesService;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Controlador de Categorías", description = "Controlador para gestionar categorías")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})
public class CategoriesController {
    private final CategoriesService service;

    public CategoriesController(CategoriesService service) {
        this.service = service;
    }

    @GetMapping("/")
    @Operation(summary = "Traer todas las categorías", description = "Trae el listado de las categorías en el sistema")
    public ResponseEntity<ApiResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/active")
    @Operation(summary = "Traer categorías activas", description = "Obtiene el listado de categorías que están activas")
    public ResponseEntity<ApiResponse> findActiveCategories() {
        return service.findActiveCategories();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Traer una categoría por ID", description = "Obtiene una categoría específica por su ID")
    public ResponseEntity<ApiResponse> findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/")
    @Operation(summary = "Guardar una categoría", description = "Guarda una nueva categoría en el sistema")
    public ResponseEntity<ApiResponse> save(@RequestBody CategoriesDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una categoría", description = "Actualiza una categoría existente por su ID")
    public ResponseEntity<ApiResponse> update(
            @PathVariable Long id,
            @RequestBody CategoriesDto dto
    ) {
        if (!id.equals(dto.getId())) {
            return new ResponseEntity<>(
                    new ApiResponse("ID mismatch", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }
        return service.update(dto);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar el estado de una categoría", description = "Cambia el estado de una categoría por su ID")
    public ResponseEntity<ApiResponse> changeStatus(@PathVariable Long id) {
        return service.changeStatus(id);
    }
}