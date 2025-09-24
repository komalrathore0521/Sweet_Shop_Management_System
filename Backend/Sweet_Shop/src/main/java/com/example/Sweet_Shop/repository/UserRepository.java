package com.example.Sweet_Shop.repository;


import com.example.Sweet_Shop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}