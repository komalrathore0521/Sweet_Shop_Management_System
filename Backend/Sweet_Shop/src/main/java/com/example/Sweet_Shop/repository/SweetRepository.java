package com.example.Sweet_Shop.repository;



import com.example.Sweet_Shop.model.Sweet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

@Repository
public interface SweetRepository extends JpaRepository<Sweet, Long>, JpaSpecificationExecutor<Sweet> {

}


