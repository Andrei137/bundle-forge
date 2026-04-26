package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Image;
import com.unibuc.bundle_forge.repository.ImageRepository;
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

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final ImageRepository imageRepository;
    private Path storagePath;

    @PostConstruct
    public void init() throws IOException {
        storagePath = Paths.get(uploadDir);
        Files.createDirectories(storagePath);
    }

    public Image uploadImage(MultipartFile file) {
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

            Image image = new Image();
            image.setPath(storedName);

            return imageRepository.save(image);
        }
        catch (IOException e) {
            throw new ValidationException(e.getMessage());
        }
    }

    public List<Image> uploadImages(List<MultipartFile> files) {
        List<Image> images = new ArrayList<>();
        for (MultipartFile file : files) {
            images.add(uploadImage(file));
        }
        return images;
    }

    public byte[] getImage(Image image) {
        try {
            String storedFileName = image.getPath();
            Path filePath = storagePath.resolve(storedFileName).normalize();

            if (!Files.exists(filePath)) {
                throw new ValidationException("File not found: " + storedFileName);
            }

            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new ValidationException("Failed to read file: " + e.getMessage());
        }
    }

    public List<byte[]> getImages(List<Image> images) {
        List <byte[]> result = new ArrayList<>();
        for (Image image : images) {
            result.add(getImage(image));
        }
        return result;
    }

}
