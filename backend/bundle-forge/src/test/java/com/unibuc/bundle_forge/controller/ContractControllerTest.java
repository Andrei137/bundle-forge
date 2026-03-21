package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.service.ContractService;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContractController.class)
public class ContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContractService contractService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllContracts_ShouldReturnListOfContracts() throws Exception {
        Mockito.when(contractService.getAllContracts()).thenReturn(TestUtils.contracts);

        var result = mockMvc.perform(get("/contracts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.contracts.size()));

        for (int i = 0; i < TestUtils.contracts.size(); i++) {
            TestUtils.assertContract(result, "[" + i + "]", TestUtils.contracts.get(i));
        }
    }

    @Test
    void issueContract_ShouldReturnCreatedContract() throws Exception {
        ContractDto contractDto = ContractDto.builder()
                .cutPercentage(TestUtils.contract1.getCutPercentage())
                .expiryDate(TestUtils.contract1.getExpiryDate())
                .build();

        Mockito.when(contractService.issueContract(contractDto, TestUtils.contract1.getId().getGameId()))
                .thenReturn(TestUtils.contract1);

        var result = mockMvc.perform(post(String.format("/contracts/%d", TestUtils.contract1.getId().getGameId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contractDto)))
                .andExpect(status().isCreated());

        TestUtils.assertContract(result, "", TestUtils.contract1);
    }

    @Test
    void updateContract_ShouldReturnUpdatedContract() throws Exception {
        ContractDto contractDto = ContractDto.builder()
                .cutPercentage(40)
                .expiryDate(TestUtils.contract1.getExpiryDate())
                .status("accepted")
                .build();
        Contract updatedContract = Contract.builder()
                .id(TestUtils.contract1.getId())
                .cutPercentage(contractDto.getCutPercentage())
                .expiryDate(contractDto.getExpiryDate())
                .status(Contract.Status.ACCEPTED)
                .build();

        Mockito.when(contractService.updateContract(contractDto, TestUtils.contract1.getId().getGameId()))
                .thenReturn(updatedContract);

        var result = mockMvc.perform(put(String.format("/contracts/%d", TestUtils.contract1.getId().getGameId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contractDto)))
                .andExpect(status().isOk());

        TestUtils.assertContract(result, "", updatedContract);
    }

    @Test
    void deleteContract_ShouldReturnNoContent() throws Exception {
        Mockito.doNothing().when(contractService).deleteContract(TestUtils.contract1.getId().getGameId());

        mockMvc.perform(delete(String.format("/contracts/%d", TestUtils.contract1.getId().getGameId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}