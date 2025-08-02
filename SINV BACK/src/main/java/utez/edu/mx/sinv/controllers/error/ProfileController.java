package utez.edu.mx.sinv.controllers.error;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Controlador de Perfil", description = "Controlador para obtener el perfil activo de la aplicación")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})

public class ProfileController {

    @Value("${app.environment:default}")
    private String environment;

    @GetMapping("/profile")
    @Operation(summary = "Obtener Perfil Activo", description = "Devuelve el perfil activo de la aplicación")
    public String getActiveProfile() {
        return "Perfil activo: " + environment;
    }

    @GetMapping("/error-test")
    @Operation(summary = "Prueba de Error", description = "Endpoint para probar el manejo de errores")
    public String errorTest() {
        return "Error test endpoint";
    }

}