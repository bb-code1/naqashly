package com.naqashly.finance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.finance.entity.Wallet;
import com.naqashly.finance.controller.WalletController.CreateWalletRequest;
import com.naqashly.finance.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WalletController.class)
public class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetWalletsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/finance/wallets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetWalletsSuccess() throws Exception {
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(100L)
                .name("Pocket Cash")
                .currency("INR")
                .balance(new BigDecimal("500.00"))
                .build();

        when(walletRepository.findByUserId(100L)).thenReturn(List.of(wallet));

        mockMvc.perform(get("/api/v1/finance/wallets")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Pocket Cash"))
                .andExpect(jsonPath("$[0].balance").value(500.00));
    }

    @Test
    public void testCreateWalletSuccess() throws Exception {
        CreateWalletRequest request = new CreateWalletRequest();
        request.setName("Savings Wallet");
        request.setCurrency("INR");
        request.setInitialBalance(new BigDecimal("1000.00"));

        Wallet savedWallet = Wallet.builder()
                .id(2L)
                .userId(100L)
                .name("Savings Wallet")
                .currency("INR")
                .balance(new BigDecimal("1000.00"))
                .build();

        when(walletRepository.save(any(Wallet.class))).thenReturn(savedWallet);

        mockMvc.perform(post("/api/v1/finance/wallets")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("Savings Wallet"))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }
}
