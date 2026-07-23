package com.naqashly.journal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Knowledge, Scratchpad & Journal Microservice Entry Point</h1>
 * 
 * <p><b>WHAT:</b> Spring Boot 3.3.2 microservice running on Port 8086 dedicated to personal markdown notes, office/career journal entries, and saved link references.</p>
 * <p><b>WHY:</b> Decouples unstructured knowledge management from execution-focused task productivity, keeping tasks fast while providing full-text searchable reflection logs.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class JournalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(JournalServiceApplication.class, args);
    }
}
