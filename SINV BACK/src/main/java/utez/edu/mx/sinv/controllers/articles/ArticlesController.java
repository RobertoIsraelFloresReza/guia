package utez.edu.mx.sinv.controllers.articles;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.articles.dto.ArticlesDto;
import utez.edu.mx.sinv.services.articles.ArticlesService;

@RestController
@RequestMapping("/api/articles")
@Tag(name = "Controlador de Artículos", description = "Controlador para gestionar artículos")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})
public class ArticlesController {
    private final ArticlesService service;

    public ArticlesController(ArticlesService service) {
        this.service = service;
    }

    @GetMapping("/")
    @Operation(summary = "Traer todas las cedes", description = "Trae el listado de las cedes en el sistema")
    public ResponseEntity<ApiResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Traer un artículo por ID", description = "Obtiene un artículo específico por su ID")
    public ResponseEntity<ApiResponse> findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/")
    @Operation(summary = "Guardar un artículo", description = "Guarda un nuevo artículo en el sistema")
    public ResponseEntity<ApiResponse> save(@RequestBody ArticlesDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un artículo", description = "Actualiza un artículo existente por su ID")
    public ResponseEntity<ApiResponse> update(
            @PathVariable Long id,
            @RequestBody ArticlesDto dto
    ) {
        if (!id.equals(dto.getId())) {
            return new ResponseEntity<>(
                    new ApiResponse("ID mismatch", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }
        return service.update(dto);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar el estado de un artículo", description = "Cambia el estado de un artículo por su ID")
    public ResponseEntity<ApiResponse> changeStatus(@PathVariable Long id) {
        return service.changeStatus(id);
    }

    @GetMapping("/storage/{storageId}")
    @Operation(summary = "Traer artículos por ID de almacenamiento", description = "Obtiene los artículos asociados a un almacenamiento específico")
    public ResponseEntity<ApiResponse> findByStorage(
            @PathVariable Long storageId
    ) {
        return service.findByStorage(storageId);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un artículo", description = "Elimina un artículo por su ID")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        return service.delete(id);
        }
}