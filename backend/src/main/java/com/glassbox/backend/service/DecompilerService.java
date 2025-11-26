package com.glassbox.backend.service;

import org.benf.cfr.reader.api.CfrDriver;
import org.benf.cfr.reader.api.OutputSinkFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
public class DecompilerService {

    public String decompile(String jarPath, String className) {
        StringBuilder output = new StringBuilder();

        OutputSinkFactory mySink = new OutputSinkFactory() {
            @Override
            public List<SinkClass> getSupportedSinks(SinkType sinkType, Collection<SinkClass> collection) {
                return Collections.singletonList(SinkClass.STRING);
            }

            @Override
            public <T> Sink<T> getSink(SinkType sinkType, SinkClass sinkClass) {
                return new Sink<T>() {
                    @Override
                    public void write(T t) {
                        output.append(t);
                    }
                };
            }
        };

        CfrDriver driver = new CfrDriver.Builder()
                .withOutputSink(mySink)
                .build();

        driver.analyse(Collections.singletonList(jarPath));

        // Note: CFR decompiles the whole JAR or specific classes if filtered. 
        // For this MVP, we might need to filter or just return the whole thing if it's a single class file.
        // However, standard CFR usage on a JAR decompiles everything. 
        // To decompile a specific class from a JAR, we usually pass the class name.
        // But CfrDriver.analyse takes a list of files (jars or class files).
        
        // If we want to decompile a SPECIFIC class from a JAR, we might need to extract it first or use a different API.
        // Let's try to just return the output for now. 
        // Realistically, for a "Subway Map", we want just the method logic.
        
        return output.toString();
    }
    
    // Better approach: Use CFR to decompile a specific class by passing it as an argument if possible, 
    // or filtering the output.
    // For now, let's assume we can pass the class file path directly if we extract it, 
    // OR we just scan the whole JAR and filter the output (expensive).
    
    // Let's refine this to be more robust later. 
    // For the Hackathon, maybe we just decompile the specific class file if we can locate it inside the JAR.
}
