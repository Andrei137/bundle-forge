package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageServiceTest {

    @TempDir
    Path tempDir;

    private ImageService imageService;

    @BeforeEach
    void setUp() throws IOException {
        imageService = new ImageService();
        ReflectionTestUtils.setField(imageService, "uploadDir", tempDir.toString());
        imageService.init();
    }

    @Test
    void uploadImage_storesAndReturnsPath() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", new byte[]{1, 2, 3, 4});

        String path = imageService.uploadImage(file);

        assertThat(path).startsWith("/" + tempDir + "/").endsWith("_cover.png");
        String filename = path.substring(path.lastIndexOf('/') + 1);
        assertThat(Files.exists(tempDir.resolve(filename))).isTrue();
    }

    @Test
    void uploadImage_emptyFile_throws() {
        MockMultipartFile empty = new MockMultipartFile("file", "x.png", "image/png", new byte[]{});
        assertThatThrownBy(() -> imageService.uploadImage(empty))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Empty");
    }

    @Test
    void uploadImage_invalidExtension_throws() {
        MockMultipartFile bad = new MockMultipartFile("file", "evil.exe", "application/octet-stream", new byte[]{1});
        assertThatThrownBy(() -> imageService.uploadImage(bad))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Unsupported");
    }

    @Test
    void uploadImage_noOriginalName_throws() {
        MockMultipartFile noName = new MockMultipartFile("file", null, "image/png", new byte[]{1});
        assertThatThrownBy(() -> imageService.uploadImage(noName))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void uploadImages_storesAll() {
        List<String> result = imageService.uploadImages(List.of(
                new MockMultipartFile("a", "a.jpg", "image/jpeg", new byte[]{1}),
                new MockMultipartFile("b", "b.gif", "image/gif", new byte[]{2})));

        assertThat(result).hasSize(2);
    }

    @Test
    void deleteImage_removesFile() {
        MockMultipartFile file = new MockMultipartFile("f", "del.png", "image/png", new byte[]{9});
        String path = imageService.uploadImage(file);
        String filename = path.substring(path.lastIndexOf('/') + 1);
        assertThat(Files.exists(tempDir.resolve(filename))).isTrue();

        imageService.deleteImage(path);
        assertThat(Files.exists(tempDir.resolve(filename))).isFalse();
    }

    @Test
    void deleteImage_null_isNoop() {
        imageService.deleteImage(null);
    }

    @Test
    void deleteImage_missing_isNoop() {
        imageService.deleteImage("/" + tempDir + "/does-not-exist.png");
    }
}
