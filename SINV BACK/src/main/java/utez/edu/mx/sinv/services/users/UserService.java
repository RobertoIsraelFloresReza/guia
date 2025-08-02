package utez.edu.mx.sinv.services.users;

import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.models.passwordreset.PasswordResetToken;
import utez.edu.mx.sinv.models.passwordreset.PasswordResetTokenRepository;
import utez.edu.mx.sinv.models.storage.Storage;
import utez.edu.mx.sinv.models.storage.StorageRepository;
import utez.edu.mx.sinv.models.user.Users;
import utez.edu.mx.sinv.models.user.UsersRepository;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class UserService {
    // Constantes para mensajes y claves repetidas
    private static final String VALID_KEY = "valid";
    private static final String EMAIL_EXISTS_MESSAGE = "El correo electrónico ya está registrado";
    private static final String USER_NOT_FOUND_MESSAGE = "Usuario no encontrado";
    private static final int TOKEN_LENGTH = 10;
    private static final int TOKEN_EXPIRATION_HOURS = 1;

    private final UsersRepository usersRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final StorageRepository storageRepository;

    public UserService(UsersRepository usersRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository, StorageRepository storageRepository) {
        this.usersRepository = usersRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.storageRepository = storageRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();}

    public ResponseEntity<Map<String, Object>> verifyPassword(Long userId, String password) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Users> userOpt = usersRepository.findById(userId);
            if (userOpt.isEmpty()) {
                response.put(VALID_KEY, false);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Users user = userOpt.get();
            if (!user.getPassword().startsWith("$2a$")) {
                response.put(VALID_KEY, false);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            response.put(VALID_KEY, passwordEncoder.matches(password, user.getPassword()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(VALID_KEY, false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<ApiResponse> findByEmailHandler(String email) {
        return usersRepository.findByEmail(email)
                .map(user -> new ResponseEntity<>(new ApiResponse(user, HttpStatus.OK), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND), HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> getAll() {
        return new ResponseEntity<>(new ApiResponse(usersRepository.findAll(), HttpStatus.OK), HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> getUserById(Long id) {
        return usersRepository.findById(id)
                .map(user -> new ResponseEntity<>(new ApiResponse(user, HttpStatus.OK), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST));
    }

    @Transactional
    public ResponseEntity<ApiResponse> deleteUserById(Long id) {
        if (!usersRepository.existsById(id)) {
            return new ResponseEntity<>(new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
        }
        usersRepository.deleteById(id);
        return new ResponseEntity<>(new ApiResponse(), HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> saveWorker(Users worker) {
        if (usersRepository.findByEmail(worker.getEmail()).isPresent()) {
            return new ResponseEntity<>(new ApiResponse(EMAIL_EXISTS_MESSAGE, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
        }
        worker.setStatus(true);
        worker.setPassword(passwordEncoder.encode(worker.getPassword()));

        Users savedUser = usersRepository.save(worker);
        return new ResponseEntity<>(new ApiResponse(savedUser, HttpStatus.OK), HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> updateUserById(Users updatedUser) {
        return usersRepository.findById(updatedUser.getId())
                .map(existingUser -> {
                    // Actualizar campos básicos
                    if (updatedUser.getUsername() != null) {
                        existingUser.setUsername(updatedUser.getUsername());
                    }
                    if (updatedUser.getFullName() != null) {
                        existingUser.setFullName(updatedUser.getFullName());
                    }

                    // Actualizar contraseña si se proporciona
                    updateUserPasswordIfNeeded(updatedUser, existingUser);

                    // Actualizar email con validación
                    if (!updateUserEmailIfValid(updatedUser, existingUser)) {
                        return new ResponseEntity<>(
                                new ApiResponse(EMAIL_EXISTS_MESSAGE, HttpStatus.BAD_REQUEST),
                                HttpStatus.BAD_REQUEST);
                    }

                    // Actualizar rol si se proporciona
                    if (updatedUser.getRole() != null) {
                        existingUser.setRole(updatedUser.getRole());
                    }

                    // Actualizar estado si se proporciona
                    if (updatedUser.getStatus() != null) {
                        existingUser.setStatus(updatedUser.getStatus());
                    }

                    Users savedUser = usersRepository.save(existingUser);
                    return new ResponseEntity<>(new ApiResponse(savedUser, HttpStatus.OK), HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST));
    }

    private void updateUserPasswordIfNeeded(Users updatedUser, Users existingUser) {
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
    }

    private boolean updateUserEmailIfValid(Users updatedUser, Users existingUser) {
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()
                && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            if (usersRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                return false;
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        return true;
    }



    @Transactional
    public ResponseEntity<ApiResponse> changeStatus(Long id) {
        return usersRepository.findById(id)
                .map(user -> {
                    user.setStatus(!user.getStatus()); // Invierte el estado actual
                    Users updatedUser = usersRepository.save(user);
                    return new ResponseEntity<>(
                            new ApiResponse(updatedUser, HttpStatus.OK),
                            HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST));
    }

    @Transactional
    public ResponseEntity<ApiResponse> updatePassword(Long userId, String newPassword) {
        return usersRepository.findById(userId)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    Users updatedUser = usersRepository.save(user);
                    return new ResponseEntity<>(new ApiResponse(updatedUser, HttpStatus.OK), HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST));
    }

    @Transactional(readOnly = true)
    public Optional<Users> findByEmail(String email) {
        return usersRepository.findByEmail(email);
    }

    @Transactional
    public String generatePasswordResetToken(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MESSAGE));

        passwordResetTokenRepository.deleteByUser(user);

        String token = RandomStringUtils.randomAlphanumeric(TOKEN_LENGTH).toUpperCase();
        Date expiryDate = new Date(System.currentTimeMillis() + TOKEN_EXPIRATION_HOURS * 3600000);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(expiryDate);
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);
        return token;
    }

    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .map(resetToken -> !resetToken.isUsed() && resetToken.getExpiryDate().after(new Date()))
                .orElse(false);
    }

    @Transactional
    public void markTokenAsUsed(String token) {
        passwordResetTokenRepository.findByToken(token).ifPresent(resetToken -> {
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);
        });
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteExpiredTokens(new Date());
    }


    // Agregar estos métodos al UserService existente

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findByRole(String roleName) {
        List<Users> users = usersRepository.findByRoleName(roleName);
        return new ResponseEntity<>(
                new ApiResponse(users, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> assignStorageToUser(Long userId, Long storageId) {
        return usersRepository.findById(userId)
                .map(user -> {
                    // Validar que el usuario tenga rol de RESPONSABLE
                    if (!"RESPONSABLE".equals(user.getRole().getName())) {
                        return new ResponseEntity<>(
                                new ApiResponse("User is not a RESPONSABLE", HttpStatus.BAD_REQUEST),
                                HttpStatus.BAD_REQUEST);
                    }

                    // Validar que el almacén existe
                    Optional<Storage> storage = storageRepository.findById(storageId);
                    if (storage.isEmpty()) {
                        return new ResponseEntity<>(
                                new ApiResponse("Storage not found", HttpStatus.BAD_REQUEST),
                                HttpStatus.BAD_REQUEST);
                    }

                    // Asignar el usuario como responsable del almacén
                    storage.get().setResponsible(user);
                    storageRepository.save(storage.get());

                    return new ResponseEntity<>(
                            new ApiResponse(storage.get(), HttpStatus.OK),
                            HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse(USER_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND),
                        HttpStatus.NOT_FOUND));
    }



    @Transactional
    public ResponseEntity<Map<String, Object>> requestPasswordReset(Map<String, String> body) {
    Map<String, Object> response = new HashMap<>();
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            response.put(VALID_KEY, false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put(VALID_KEY, false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Users user = userOpt.get();
        String token = generatePasswordResetToken(user.getId());
        response.put("token", token);
        response.put(VALID_KEY, true);

        // Aquí podrías enviar el token por correo electrónico al usuario
        // sendEmail(user.getEmail(), token);

        return ResponseEntity.ok(response);
    }

    @Transactional
    public ResponseEntity<Map<String, String>> resetPassword(Map<String, String> body) {
    Map<String, String> response = new HashMap<>();
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            response.put(VALID_KEY, "false");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!validateToken(token)) {
            response.put(VALID_KEY, "false");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        Users user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);

        markTokenAsUsed(token);
        response.put(VALID_KEY, "true");
        return ResponseEntity.ok(response);
    }
}