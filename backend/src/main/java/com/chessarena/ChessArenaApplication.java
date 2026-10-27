package com.chessarena;

import com.chessarena.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
@org.springframework.scheduling.annotation.EnableScheduling
public class ChessArenaApplication {

    public static void main(String[] args) {
        DotenvLoader.load();
        SpringApplication.run(ChessArenaApplication.class, args);
    }
}
