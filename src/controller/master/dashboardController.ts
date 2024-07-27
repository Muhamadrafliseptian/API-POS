import { Controller, Post } from "@nestjs/common";
import { DashboardServices } from "src/services/master/dashboardServices";

@Controller('api/dashboard')

export class DashboardController{
    constructor(
        private dashboardServices: DashboardServices
    ){}

    @Post('count')
    async countData():Promise<any>{
        try {
            const response = await this.dashboardServices.getCountData()
            return response
        } catch(err){

        }
    }

    @Post('schedule_shift')
    async getScheduleShift():Promise<any>{
        const response = await this.dashboardServices.getScheduleShift()
        return response
    }

    @Post('count-today-paid')
  async countTodayPaidTransactions():Promise<any> {
    const result = await this.dashboardServices.countTodayPaidTransactions();
    return result
  }
}