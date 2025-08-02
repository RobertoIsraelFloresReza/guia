package utez.edu.mx.sinv.controllers.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.auth.dto.SignDto;
import utez.edu.mx.sinv.services.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/auth")
@Tag(name = "Controlador de Autenticación", description = "Controlador para gestionar la autenticación de usuarios")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})
@Controller
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/signin")
    @Operation(summary = "Iniciar sesión", description = "Permite a los usuarios iniciar sesión en el sistema")
    public ResponseEntity<ApiResponse> signIn(@RequestBody SignDto signDto){
        return service.signIn(signDto.getEmail(),signDto.getPassword());
    }
}
