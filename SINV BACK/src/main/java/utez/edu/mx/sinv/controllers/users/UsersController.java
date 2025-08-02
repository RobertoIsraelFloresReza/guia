package utez.edu.mx.sinv.controllers.users;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.mail.MessagingException;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.users.dto.UsersDto;
import utez.edu.mx.sinv.models.user.Users;
import utez.edu.mx.sinv.services.EmailService;
import utez.edu.mx.sinv.services.users.UserService;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Controlador de Usuarios", description = "Controlador para gestionar usuarios del sistema")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})
public class UsersController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String USER_ID_KEY = "userId";
    private static final String USER_NOT_FOUND_MSG = "No se encontró usuario con ese correo electrónico.";
    private static final String EMAIL_SENT_MSG = "Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.";

    private final UserService service;
    private final EmailService emailService;

    public UsersController(UserService service, EmailService emailService) {
        this.service = service;
        this.emailService = emailService;
    }

    @GetMapping("/")
    @Operation(summary = "Obtener todos los usuarios", description = "Obtiene el listado de todos los usuarios en el sistema")
    public ResponseEntity<ApiResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Obtiene un usuario específico por su ID")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable Long id) {
        return service.getUserById(id);
    }

    @GetMapping("/by-role/{roleName}")
    @Operation(summary = "Obtener usuarios por rol", description = "Obtiene un listado de usuarios filtrados por su rol")
    public ResponseEntity<ApiResponse> findByRole(
            @PathVariable String roleName
    ) {
        return service.findByRole(roleName);
    }

    @PostMapping("/")
    @Operation(summary = "Guardar un nuevo usuario", description = "Guarda un nuevo usuario en el sistema")
    public ResponseEntity<ApiResponse> save(@RequestBody UsersDto dto) {
        return service.saveWorker(dto.toEntity());
    }

    @PutMapping("/{id}")
@Operation(summary = "Actualizar usuario por ID", description = "Actualiza un usuario existente por su ID")
    public ResponseEntity<ApiResponse> updateUserById(
            @PathVariable Long id,
            @RequestBody UsersDto userDto) {
        if (!id.equals(userDto.getId())) {
            return new ResponseEntity<>(new ApiResponse(
                    HttpStatus.BAD_REQUEST, true , "ID mismatch"
            ), HttpStatus.BAD_REQUEST);
        }
        return service.updateUserById(userDto.toEntity());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario por ID", description = "Elimina un usuario específico por su ID")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        return service.deleteUserById(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar estado de usuario", description = "Cambia el estado de un usuario por su ID")
    public ResponseEntity<ApiResponse> changeStatus(@PathVariable Long id) {
        return service.changeStatus(id);
    }

    @GetMapping("/by-email/{email}")
    @Operation(summary = "Obtener usuario por correo electrónico", description = "Obtiene un usuario específico por su correo electrónico")
    public ResponseEntity<ApiResponse> findByEmail(@PathVariable String email) {
        return service.findByEmailHandler(email);
    }

    @PostMapping("/verify-password")
    @Operation(summary = "Verificar contraseña de usuario", description = "Verifica la contraseña de un usuario por su ID")
    public ResponseEntity<Map<String, Object>> verifyPassword(
            @RequestBody Map<String, Object> request
    ) {
        return service.verifyPassword(
                Long.valueOf(request.get("userId").toString()),
                (String) request.get("password")
        );
    }

    @PostMapping("/request-password-reset")
    @Operation(summary = "Solicitar restablecimiento de contraseña", description = "Solicita el restablecimiento de contraseña para un usuario por correo electrónico")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(@RequestBody Map<String, String> body) throws MessagingException {
        String email = body.get("email");
        Optional<Users> userOptional = service.findByEmail(email);

        if (!userOptional.isPresent()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put(ERROR_KEY, USER_NOT_FOUND_MSG);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        Users user = userOptional.get();
        String token = service.generatePasswordResetToken(user.getId());
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        Map<String, Object> response = new HashMap<>();
        response.put(MESSAGE_KEY, EMAIL_SENT_MSG);
        response.put(USER_ID_KEY, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña de un usuario utilizando un token")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body
    ) {
        return service.resetPassword(body);
    }
}