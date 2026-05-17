package com.unibuc.bundle_forge;

import com.unibuc.bundle_forge.integration.IntegrationTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Import(IntegrationTestConfig.class)
@ActiveProfiles("test")
class BundleForgeApplicationTests {

	@Test
	void contextLoads() {
	}

}
