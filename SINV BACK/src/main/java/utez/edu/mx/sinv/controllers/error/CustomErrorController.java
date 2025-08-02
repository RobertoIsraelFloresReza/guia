package utez.edu.mx.sinv.controllers.error;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/error")
@Tag(name = "Controlador de Errores", description = "Controlador para manejar errores y redirigir a vistas personalizadas")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})

public class CustomErrorController implements ErrorController {
    @GetMapping
    @Operation(summary = "Manejo de Errores", description = "Redirige a una vista personalizada en caso de error")
    public String handleError() {
        return "error/error"; // Redirige a la vista personalizada
    }
}