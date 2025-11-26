export const mockData = {
    summary: { totalNodes: 5, depth: 3 },
    nodes: [
        {
            id: 'src-1',
            type: 'source',
            position: { x: 100, y: 100 },
            data: {
                label: 'CheckoutController',
                subLabel: 'buy()',
                code: `package com.myorg.store.controller;

import com.myorg.payment.PaymentLib;
import org.springframework.web.bind.annotation.*;

@RestController
public class CheckoutController {

    private final PaymentLib paymentLib;

    public CheckoutController(PaymentLib paymentLib) {
        this.paymentLib = paymentLib;
    }

    @PostMapping("/buy")
    public String buy(@RequestBody Order order) {
        // Calling internal library
        return paymentLib.process(order.getAmount());
    }
}`
            }
        },
        {
            id: 'dep-1',
            type: 'dependency',
            position: { x: 400, y: 100 },
            data: {
                label: 'PaymentLib',
                subLabel: 'process(double)',
                code: `package com.myorg.payment;

import com.myorg.core.CurrencyConverter;

public class PaymentLib {

    private final CurrencyConverter converter;

    public PaymentLib() {
        this.converter = new CurrencyConverter();
    }

    public String process(double amount) {
        // Decompiled logic
        double usd = converter.toUSD(amount);
        if (usd > 1000) {
            return "High Value Transaction Approved";
        }
        return "Transaction Approved";
    }
}`
            }
        },
        {
            id: 'dep-2',
            type: 'dependency',
            position: { x: 700, y: 100 },
            data: {
                label: 'CurrencyConverter',
                subLabel: 'toUSD(double)',
                code: `package com.myorg.core;

public class CurrencyConverter {

    public double toUSD(double amount) {
        // Decompiled logic
        return amount * 1.1; // Hardcoded rate
    }
}`
            }
        }
    ],
    edges: [
        { id: 'e1', source: 'src-1', target: 'dep-1', animated: true, label: 'calls' },
        { id: 'e2', source: 'dep-1', target: 'dep-2', animated: true, label: 'calls' }
    ]
};
