package com.chessarena.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class DotenvLoader {

    private static final Logger log = LoggerFactory.getLogger(DotenvLoader.class);

    public static void load() {
        File[] candidatePaths = new File[] {
            new File(".env"),
            new File("../.env"),
            new File("backend/.env")
        };

        for (File file : candidatePaths) {
            if (file.exists() && file.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();

                            // Strip optional enclosing single or double quotes
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }

                            // Only populate if not already supplied via OS environment or JVM args
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    log.info("Successfully loaded environment variables from: {}", file.getAbsolutePath());
                    return;
                } catch (IOException e) {
                    log.warn("Could not read .env file from {}: {}", file.getAbsolutePath(), e.getMessage());
                }
            }
        }
        log.info("No local .env file found; using system environment variables.");
    }
}
