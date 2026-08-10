package com.naqashly.finance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.finance.entity.Transaction;
import com.naqashly.finance.entity.TransactionType;
import com.naqashly.finance.entity.Wallet;
import com.naqashly.finance.controller.TransactionController.CreateTransactionRequest;
import com.naqashly.finance.repository.TransactionRepository;
import com.naqashly.finance.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionRepository transactionRepository;

    @MockBean
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllUserTransactionsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/finance/transactions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetAllUserTransactionsSuccess() throws Exception {
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(100L)
                .name("Savings")
                .currency("INR")
                .balance(new BigDecimal("1000.00"))
                .build();

        Transaction tx = Transaction.builder()
                .id(10L)
                .walletId(1L)
                .transactionType(TransactionType.EXPENSE)
                .amount(new BigDecimal("200.00"))
                .category("Food")
                .description("Lunch")
                .build();

        when(walletRepository.findByUserId(100L)).thenReturn(List.of(wallet));
        when(transactionRepository.findByWalletIdInOrderByCreatedAtDesc(List.of(1L)))
                .thenReturn(List.of(tx));

        mockMvc.perform(get("/api/v1/finance/transactions")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].amount").value(200.00))
                .andExpect(jsonPath("$[0].category").value("Food"));
    }

    @Test
    public void testCreateTransactionSuccess() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setWalletId(1L);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(new BigDecimal("150.00"));
        request.setCategory("Shopping");
        request.setDescription("Clothes");

        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(100L)
                .name("Savings")
                .currency("INR")
                .balance(new BigDecimal("1000.00"))
                .build();

        Transaction savedTx = Transaction.builder()
                .id(12L)
                .walletId(1L)
                .transactionType(TransactionType.EXPENSE)
                .amount(new BigDecimal("150.00"))
                .category("Shopping")
                .description("Clothes")
                .build();

        when(walletRepository.findByIdAndUserId(1L, 100L)).thenReturn(Optional.of(wallet));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        mockMvc.perform(post("/api/v1/finance/transactions")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transaction.id").value(12))
                .andExpect(jsonPath("$.updatedWalletBalance").value(850.00)); // 1000 - 150
    }
}
