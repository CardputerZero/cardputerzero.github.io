# Battery & Power

## Specs

| Component | Detail |
|-----------|--------|
| Battery | 1500 mAh LiPo 3.7V |
| Fuel Gauge | BQ27220 (I2C 0x55) |
| Charger | IP2315 (USB-C) |
| DC-DC | SY7088 ×2 |
| Power Budget | VSYS_5V total = 6W, CM0 ≈ 3W |

## Reading Battery Status

### From sysfs
```bash
cat /sys/class/power_supply/*/capacity     # SOC percentage
cat /sys/class/power_supply/*/voltage_now  # Microvolts
cat /sys/class/power_supply/*/current_now  # Microamps
cat /sys/class/power_supply/*/temp         # Temperature (0.1°C)
cat /sys/class/power_supply/*/status       # Charging/Discharging/Full
```

### From I2C (BQ27220 direct)
```bash
i2cget -y 1 0x55 0x02 w  # Voltage (mV)
i2cget -y 1 0x55 0x04 w  # Average current (mA)
i2cget -y 1 0x55 0x06 w  # Temperature (0.1K)
i2cget -y 1 0x55 0x1c w  # State of charge (%)
```

### In C (APPLauncher HAL)
```c
hal_battery_info_t bat = hal_battery_read();
printf("SOC: %d%%, Voltage: %dmV, Current: %dmA\n",
       bat.soc, bat.voltage_mv, bat.current_ma);
```

## Power States

| State | Description | Current |
|-------|-------------|---------|
| Active (screen on) | Normal use | ~800-1200 mA |
| Idle (screen dimmed) | Background only | ~400 mA |
| Shutdown | Power off | ~0 mA |
