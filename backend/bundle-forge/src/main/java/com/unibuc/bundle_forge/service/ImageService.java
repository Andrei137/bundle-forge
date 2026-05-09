package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.ValidationException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path storagePath;

    @PostConstruct
    public void init() throws IOException {
        storagePath = Paths.get(uploadDir);
        Files.createDirectories(storagePath);
    }

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("Empty file");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase(Locale.ROOT)
                .matches(".*\\.(jpg|jpeg|png|gif)$")) {
            throw new ValidationException("Unsupported file type");
        }

        String cleanName = Paths.get(originalName).getFileName().toString();
        String storedName = UUID.randomUUID() + "_" + cleanName;

        Path targetFile = storagePath.resolve(storedName).normalize();

        try {
            InputStream stream = file.getInputStream();
            Files.copy(stream, targetFile, StandardCopyOption.REPLACE_EXISTING);

            return  "/" + uploadDir + "/" + storedName;
        }
        catch (IOException e) {
            throw new ValidationException(e.getMessage());
        }
    }

    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> images = new ArrayList<>();
        for (MultipartFile file : files) {
            images.add(uploadImage(file));
        }
        return images;
    }

    public void deleteImage(String path) {
        if (path == null) return;
        try {
            String filename = path.substring(path.lastIndexOf('/') + 1);
            Path filePath = storagePath.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // best-effort deletion; don't fail the request
        }
    }

}
