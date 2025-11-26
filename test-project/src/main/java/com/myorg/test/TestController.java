package com.myorg.test;

import com.myorg.payment.PaymentLib;

public class TestController {
    
    private PaymentLib paymentLib;

    public void processOrder() {
        paymentLib.process(100.0);
    }
}
