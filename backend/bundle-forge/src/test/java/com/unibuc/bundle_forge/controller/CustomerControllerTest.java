package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.service.CustomerService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
public class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CustomerService customerService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllCustomers_ShouldReturnListOfCustomers() throws Exception {
        Mockito.when(customerService.getAllUsers()).thenReturn(TestUtils.customers);

        var result = mockMvc.perform(get("/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.customers.size()));

        for (int i = 0; i < TestUtils.customers.size(); i++) {
            TestUtils.assertCustomer(result, "[" + i + "]", TestUtils.customers.get(i));
        }
    }

    @Test
    void getCurrentCustomer_ShouldReturnCustomer() throws Exception {
        Mockito.when(customerService.getCurrentUser()).thenReturn(TestUtils.customer1);

        var result = mockMvc.perform(get("/customers/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertCustomer(result, "", TestUtils.customer1);
    }

    @Test
    void getCustomerById_ShouldReturnCustomer() throws Exception {
        Mockito.when(customerService.getUserById(TestUtils.customer1.getId())).thenReturn(TestUtils.customer1);

        var result = mockMvc.perform(get(String.format("/customers/%d", TestUtils.customer1.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertCustomer(result, "", TestUtils.customer1);
    }

    @Test
    void updateCustomer_ShouldReturnUpdatedCustomer() throws Exception {
        CustomerDto customerDto = CustomerDto.builder()
                .firstName("NewFirstName")
                .lastName("NewLastName")
                .build();
        Customer updatedCustomer = Customer.builder()
                .id(TestUtils.customer1.getId())
                .username(TestUtils.customer1.getUsername())
                .password(TestUtils.customer1.getPassword())
                .email(TestUtils.customer1.getEmail())
                .lastName(customerDto.getLastName())
                .firstName(customerDto.getFirstName())
                .phoneNumber(TestUtils.customer1.getPhoneNumber())
                .build();

        Mockito.when(customerService.updateLoggedUser(customerDto)).thenReturn(updatedCustomer);

        var result = mockMvc.perform(put("/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerDto)))
                .andExpect(status().isOk());

        TestUtils.assertCustomer(result, "", updatedCustomer);
    }

}