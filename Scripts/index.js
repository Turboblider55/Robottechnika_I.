let canvas = document.querySelector('canvas');

    const Width = window.innerWidth;
    const Height = window.innerHeight;

    canvas.width = Width;
    canvas.height = Height;

    let ctx = canvas.getContext('2d');

    Origin_x = Width / 2 ;
    Origin_y = Height / 2 ;

    //Konstansok
    const Scalar = 100;
    const First_Length = 1.2;
    const First_Min_Angle = 25;
    const First_Max_Angle = 90;
    const Second_Length = 0.9;
    const Second_Min_Angle = 45;
    const Second_Max_Angle = 135;

    First_Angle = First_Min_Angle;
    Second_Angle = Second_Min_Angle;

    class vec2d{
        constructor(x,y){
            this.x = x;
            this.y = y;
        }
    }

    
    function ClearScreen(){
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,Width,Height);
        ctx.closePath();
    };

    ConvertAngle = (Angle) => {
        return Angle / 180 * Math.PI;
    }
    
    DrawArc = (posX,posY,Rad,StartAng,EndAng,clockWise) =>{
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "rgba(255,0,0,0.5)" ;
        StartAng %= 360;
        EndAng %= 360;
        ctx.arc(posX,posY,Rad,ConvertAngle(StartAng),ConvertAngle(EndAng),clockWise);
        //ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    

    
    class Coordinate_System{
        constructor(origin_x,origin_y,angle){
            this.origin_x = origin_x;
            this.origin_y = origin_y;
            this.angle = angle;
        }

        Draw(){
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.moveTo(this.origin_x,this.origin_y);
            ctx.lineTo(this.origin_x + Math.cos(ConvertAngle(-this.angle)) * 50,this.origin_y + Math.sin(ConvertAngle(-this.angle)) * 50);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.moveTo(this.origin_x,this.origin_y);
            ctx.lineTo(this.origin_x + Math.sin(ConvertAngle(-this.angle)) * 50,this.origin_y - Math.cos(ConvertAngle(-this.angle)) * 50);
            ctx.stroke();
            ctx.closePath();
        }


    } 

    class Robot_Segment{
            
        constructor(CS,Length,Angle,Min_Angle,Max_Angle){
            this.CS = CS;
            this.Length = Length;
            this.Angle = Angle;
            this.Min_Angle = Min_Angle;
            this.Max_Angle = Max_Angle;
            this.PrevSegment = null;
            this.NextSegment = null;
        }

        GetOrigins= () =>{
            return [this.CS.origin_x,this.CS.origin_y];
        }
        GetGlobalOrigin = () => {
            if(this.PrevSegment != null)
                this.PrevSegment.GetGlobalOrigin();
            
            return this.GetOrigins();
        }
        GetSegmentEndPositionGlobal = () => {
            let End_Coord_X = this.Length * Scalar * Math.cos(ConvertAngle(-(this.CS.angle + this.Angle)));
            let End_Coord_Y = this.Length * Scalar * Math.sin(ConvertAngle(-(this.CS.angle + this.Angle)));
             
            if(this.PrevSegment == null){
                   return [this.CS.origin_x + End_Coord_X,this.CS.origin_y + End_Coord_Y];
            }

            let prevData = this.PrevSegment.GetSegmentEndPositionGlobal();
            return [prevData[0] + End_Coord_X, prevData[1] + End_Coord_Y];
        }
        SetPrevSegment(PrevSegment){
            this.PrevSegment = PrevSegment;
            let PrevEndPos = this.PrevSegment.GetSegmentEndPositionGlobal();
            this.CS = new Coordinate_System(PrevEndPos[0],PrevEndPos[1],PrevSegment.Angle + 180);
        }
        SetNextSegment(NextSegment){
            this.NextSegment = NextSegment;
        }
        Draw(){
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.fillStyle = "black";
            ctx.moveTo(this.CS.origin_x,this.CS.origin_y);
            
            let EndCoords = this.GetSegmentEndPositionGlobal();

            ctx.lineTo(EndCoords[0],EndCoords[1]);
            
            ctx.fill();
            ctx.stroke();

            ctx.closePath();
        }
        RotateAroundOrigin = (Angle,clockwise) =>{
            if(clockwise)
                this.Angle -= Angle;
            else
                this.Angle += Angle;

            this.Angle %= 360;

            if(this.Angle > this.Max_Angle)
                this.Angle = this.Max_Angle;
            else if (this.Angle < this.Min_Angle)
                this.Angle = this.Min_Angle;
            this.UpdateSegments();
        }
        SetMaxAngle(){
            this.Angle = this.Max_Angle;
            this.UpdateSegments();
        }
        SetMinAngle(){
            this.Angle = this.Min_Angle;
            this.UpdateSegments();
        }
        UpdateSegments = () =>{
            if(this.NextSegment != null){
                let EndPos = this.GetSegmentEndPositionGlobal();
                this.NextSegment.CS.origin_x = EndPos[0];
                this.NextSegment.CS.origin_y = EndPos[1];
                this.NextSegment.CS.angle = this.Angle + 180;
                this.NextSegment.UpdateSegments();
            }
        }
        DrawOwnArea(){
            if(this.NextSegment == null)
                DrawArc(this.CS.origin_x,this.CS.origin_y,this.Length * Scalar,-(this.CS.angle + this.Max_Angle),-(this.CS.angle + this.Min_Angle),false);
            else{
                let EndPos = this.GetNextXSegmentPos(1);
                let DistX = this.CS.origin_x - EndPos[0];
                let DistY = this.CS.origin_y - EndPos[1];
                let Dist = Math.sqrt((DistX)**2 + (DistY)**2);
                let Angle = Math.atan2(-DistY, -DistX) / Math.PI * 180;
                //Calculating the angle here is horrible
                //This is where i left the project off, Drawing a segments own working area is working
                //DrawArc(this.CS.origin_x,this.CS.origin_y,this.Length * Scalar,-(this.CS.angle + this.Max_Angle),-(this.CS.angle + this.Min_Angle),false);
                let StartAngle = (Angle + (this.Angle - this.Min_Angle))
                let EndAngle = (Angle - this.Max_Angle + (this.Angle))
                
                DrawArc(this.CS.origin_x,this.CS.origin_y,Dist,StartAngle,EndAngle,true);
            }
        }
        GetNextXSegmentPos(depth){
            //If depth is given it will go till that
            if(depth != null){
                if(depth == 0){
                        return this.GetSegmentEndPositionGlobal();
                    }
                if(depth > 0 && this.NextSegment != null){
                    return this.NextSegment.GetNextXSegmentPos(depth - 1);
                }
                else return [0,0];
            }
            //If no depth is given it will go till the end segment
            else{
                if(this.NextSegment != null)
                    return this.NextSegment.GetNextXSegmentPos();
                else 
                    return this.GetSegmentEndPositionGlobal();
            }
        }
        // GetNextXSegmentAngleSumGlobal(depth){
        //     let sum = 0;
        //     if(depth != null){
        //         if(depth == 0){
        //             sum += this.CS.angle + this.Angle;
        //             return sum;
        //         }
        //         if(depth > 0 && this.NextSegment != null){
        //             sum += this.NextSegment.GetNextXSegmentAngleSumGlobal(depth - 1);
        //             sum += this.CS.angle;
        //             return sum;
        //         }
        //     }
        //     else{
        //         if(this.NextSegment != null){
        //             sum += this.NextSegment.GetNextXSegmentAngleSumGlobal();
        //             sum += this.CS.angle;
        //             return sum;
        //         }
        //         else{
        //             sum += this.CS.angle + this.Angle;
        //             return sum;
        //         }
        //     }
        // }

    }
    
    class Robot_Arm{
        constructor(CS){
            this.CS = CS;
            this.Segments = new Array();
        }
        SaveSegmentsAngles(Level,arr){
            if(Level == null)
                Level = 0;

                let SegmentsAngles = [];
                if(arr != null)
                    SegmentsAngles = arr;

                    SegmentsAngles.push(this.Segments[Level].Angle);
                if(this.Segments[Level].NextSegment != null)
                    SegmentsAngles = this.SaveSegmentsAngles(Level + 1,SegmentsAngles);
                return SegmentsAngles;
             
        }
        LoadSegmentsAngles(Level,MinLevel,arr){
            
            if(Level == null || MinLevel == null || arr == null)
                return;

            this.Segments[Level].Angle = arr[Level-MinLevel];
            //console.log("Segment Angle Loaded");
            if(this.Segments[Level].NextSegment != null && Level < this.Segments.length){
                this.LoadSegmentsAngles(Level + 1,MinLevel, arr);
            }
        }
        DrawWorkingArea(Level,MinLevel,state){
            let SegmentsAngles = [];
            if(MinLevel == null){
                MinLevel = Level;
            }
            if(state == null)
                state = 0;

            if(Level == MinLevel){
                SegmentsAngles = this.SaveSegmentsAngles(Level);
                
            }
            if(Level >= 0 && Level < this.Segments.length){
                //This is where i left off, Drawing the total working area is not working
                //Beacause not all combination of angles are drawn
                //I knew the answer a long time ago
                //I just didn't watn to accept it as a solution
                //Bad thinking
                
                for(let i = 0; i < 2 ; i++){
                    if((Level + i + state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                        //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle);
                    else
                        this.Segments[Level].SetMinAngle();
                        //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle,true);
                    
                    
                    if(this.Segments[Level].NextSegment != null){
                        this.DrawWorkingArea(Level + 1,MinLevel,i);
                    }
                    this.Segments[Level].DrawOwnArea(); 

                }
                
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                //console.log("Segment Angles Loaded")
            }
                
        }
        
    }

    CS = new Coordinate_System(Width / 2,Height / 2,0);
    CS.Draw();

    let Segment1 = new Robot_Segment(CS,First_Length, First_Min_Angle, First_Min_Angle,First_Max_Angle);
    let Segment2 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    Segment1.SetNextSegment(Segment2);
    Segment2.SetPrevSegment(Segment1);

    Segment1.CS.Draw();
    Segment1.Draw();
    Segment2.CS.Draw();
    Segment2.Draw();

    Arm = new Robot_Arm(CS);
    Arm.Segments[0] = Segment1;
    Arm.Segments[1] = Segment2;
    Arm.DrawWorkingArea(0);

    addEventListener("wheel",e=>{
        if(e.deltaY < 0){
            
            Segment1.RotateAroundOrigin((First_Max_Angle - First_Min_Angle) / 10);
            Segment2.RotateAroundOrigin((Second_Max_Angle - Second_Min_Angle) / 10);
            console.log(Segment1.Angle)
        }
        else if(e.deltaY > 0){
            
            Segment1.RotateAroundOrigin(-(First_Max_Angle - First_Min_Angle) / 10);
            Segment2.RotateAroundOrigin(-(Second_Max_Angle - Second_Min_Angle) / 10);
        }
        
        ClearScreen();
        Segment1.CS.Draw();
        Segment1.Draw();
        Segment2.CS.Draw();
        Segment2.Draw();

        Arm.DrawWorkingArea(0);
    });


    
    

    


    


    



