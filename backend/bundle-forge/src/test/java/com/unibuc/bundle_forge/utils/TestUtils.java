package com.unibuc.bundle_forge.utils;

import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.JwtService;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

public class TestUtils {

    private TestUtils() {
    }

    public static final String password = "Secret__123";

    public static final Customer customer1 = Customer
            .builder()
            .id(1)
            .username("customer1")
            .password(JwtService.encryptPassword(password))
            .email("customer1@test.com")
            .lastName("Cust")
            .firstName("Omer")
            .phoneNumber("0712345678")
            .build();

    public static final Customer customer2 = Customer
            .builder()
            .id(2)
            .username("customer2")
            .password(JwtService.encryptPassword(password))
            .email("customer2@test.com")
            .lastName("Cust")
            .firstName("Omer")
            .phoneNumber("0712345678")
            .build();

    public static final Developer developer1 = Developer
            .builder()
            .id(3)
            .username("developer1")
            .password(JwtService.encryptPassword(password))
            .email("developer1@test.com")
            .website("https://developer1.com")
            .status(Provider.Status.ACCEPTED)
            .build();

    public static final Developer developer2 = Developer
            .builder()
            .id(4)
            .username("developer2")
            .password(JwtService.encryptPassword(password))
            .email("developer2@test.com")
            .website("https://developer2.com")
            .status(Provider.Status.ACCEPTED)
            .build();

    public static final Publisher publisher1 = Publisher.builder()
            .id(5)
            .username("publisher1")
            .password(JwtService.encryptPassword(password))
            .email("publisher1@test.com")
            .website("https://publisher1.com")
            .status(Provider.Status.ACCEPTED)
            .build();

    public static final Publisher publisher2 = Publisher.builder()
            .id(6)
            .username("publisher2")
            .password(JwtService.encryptPassword(password))
            .email("publisher2@test.com")
            .website("https://publisher2.com")
            .status(Provider.Status.ACCEPTED)
            .build();

    public static final ProviderResponseDto publisherDto = ProviderResponseDto
            .builder()
            .id(publisher1.getId())
            .username(publisher1.getUsername())
            .email(publisher1.getEmail())
            .status(Provider.Status.ACCEPTED)
            .website(publisher1.getWebsite())
            .type("publisher")
            .build();

    public static final ProviderResponseDto developerDto = ProviderResponseDto.builder()
            .id(developer1.getId())
            .username(developer1.getUsername())
            .email(developer1.getEmail())
            .status(Provider.Status.ACCEPTED)
            .website(developer1.getWebsite())
            .type("developer")
            .build();

    public static final Game game1 = Game.builder()
            .id(1)
            .title("Game One")
            .price(29.99)
            .releaseDate(LocalDate.now())
            .build();

    public static final Game game2 = Game.builder()
            .id(2)
            .title("Game Two")
            .price(49.99)
            .releaseDate(LocalDate.now())
            .build();

    public static final GameResponseDto gameDto1 = GameResponseDto
            .builder()
            .id(game1.getId())
            .title(game1.getTitle())
            .price(game1.getPrice())
            .releaseDate(game1.getReleaseDate())
            .build();

    public static final GameResponseDto gameDto2 = GameResponseDto
            .builder()
            .id(game2.getId())
            .title(game2.getTitle())
            .price(game2.getPrice())
            .releaseDate(game2.getReleaseDate())
            .build();

    public static final Contract contract1 = Contract.builder()
            .id(Contract.ContractId.builder().gameId(game1.getId()).publisherId(publisher1.getId()).build())
            .cutPercentage(30)
            .expiryDate(LocalDate.now())
            .status(Contract.Status.PENDING)
            .build();

    public static final Contract contract2 = Contract.builder()
            .id(Contract.ContractId.builder().gameId(game1.getId()).publisherId(publisher2.getId()).build())
            .cutPercentage(40)
            .expiryDate(LocalDate.now())
            .status(Contract.Status.PENDING)
            .build();


    public static final List<Customer> customers = Arrays.asList(customer1, customer2);

    public static final List<Developer> developers = Arrays.asList(developer1, developer2);

    public static final List<Publisher> publishers = Arrays.asList(publisher1, publisher2);

    public static final List<ProviderResponseDto> providerDtos = Arrays.asList(publisherDto, developerDto);

    public static final List<Game> games = Arrays.asList(game1, game2);

    public static final List<GameResponseDto> gameDtos = Arrays.asList(gameDto1, gameDto2);

    public static final List<Contract> contracts = Arrays.asList(contract1, contract2);


    public static void assertCustomer(ResultActions result, String index, Customer customer) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(customer.getId()))
                .andExpect(jsonPath("$" + index + ".username").value(customer.getUsername()))
                .andExpect(jsonPath("$" + index + ".email").value(customer.getEmail()))
                .andExpect(jsonPath("$" + index + ".firstName").value(customer.getFirstName()))
                .andExpect(jsonPath("$" + index + ".lastName").value(customer.getLastName()))
                .andExpect(jsonPath("$" + index + ".phoneNumber").value(customer.getPhoneNumber()));
    }

    public static void assertDeveloper(ResultActions result, String index, Developer developer) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(developer.getId()))
                .andExpect(jsonPath("$" + index + ".username").value(developer.getUsername()))
                .andExpect(jsonPath("$" + index + ".email").value(developer.getEmail()))
                .andExpect(jsonPath("$" + index + ".website").value(developer.getWebsite()));
    }

    public static void assertPublisher(ResultActions result, String index, Publisher publisher) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(publisher.getId()))
                .andExpect(jsonPath("$" + index + ".username").value(publisher.getUsername()))
                .andExpect(jsonPath("$" + index + ".email").value(publisher.getEmail()))
                .andExpect(jsonPath("$" + index + ".website").value(publisher.getWebsite()));
    }

    public static void assertProviderDto(ResultActions result, String index, ProviderResponseDto provider) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(provider.getId()))
                .andExpect(jsonPath("$" + index + ".username").value(provider.getUsername()))
                .andExpect(jsonPath("$" + index + ".email").value(provider.getEmail()))
                .andExpect(jsonPath("$" + index + ".website").value(provider.getWebsite()))
                .andExpect(jsonPath("$" + index + ".status").value(provider.getStatus().toString().toUpperCase()))
                .andExpect(jsonPath("$" + index + ".type").value(provider.getType()));
    }

    public static void assertGame(ResultActions result, String index, Game game) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(game.getId()))
                .andExpect(jsonPath("$" + index + ".title").value(game.getTitle()))
                .andExpect(jsonPath("$" + index + ".releaseDate").value(game.getReleaseDate().toString()));
    }

    public static void assertGameDto(ResultActions result, String index, GameResponseDto game) throws Exception {
        result.andExpect(jsonPath("$" + index + ".id").value(game.getId()))
                .andExpect(jsonPath("$" + index + ".title").value(game.getTitle()))
                .andExpect(jsonPath("$" + index + ".price").value(game.getPrice()))
                .andExpect(jsonPath("$" + index + ".releaseDate").value(game.getReleaseDate().toString()));
    }

    public static void assertContract(ResultActions result, String index, Contract contract) throws Exception {
        result.andExpect(jsonPath("$" + index + ".cutPercentage").value(contract.getCutPercentage()))
                .andExpect(jsonPath("$" + index + ".expiryDate").value(contract.getExpiryDate().toString()))
                .andExpect(jsonPath("$" + index + ".status").value(contract.getStatus().toString()));
    }

}
