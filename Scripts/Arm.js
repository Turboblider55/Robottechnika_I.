class Robot_Arm{
        constructor(CS){
            this.CS = CS;
            this.Segments = new Array();
            this.Points = new Array();
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
            
            if(Level == null && MinLevel == null && arr == null)
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
                if(this.Segments[Level].NextSegment != null){
                    for(let i = 0; i < 2 ; i++){
                        if((Level + i + state) % 2 == 0)
                            this.Segments[Level].SetMinAngle();
                            //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle);
                        else
                            this.Segments[Level].SetMaxAngle();
                            //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle,true);
                        
                        this.DrawWorkingArea(Level + 1,MinLevel,i); 
                        
                        this.Segments[Level].DrawOwnArea(); 
    
                    }
                }
                else{
                    if((Level + state) % 2 == 0)
                        this.Segments[Level].SetMinAngle();
                    else
                        this.Segments[Level].SetMaxAngle();

                    this.Segments[Level].DrawOwnArea(); 
                }
                
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                //console.log("Segment Angles Loaded")
            }
                
        }
        #GetWorkingAreaEndCoords(Level,MinLevel,state){
            let SegmentsAngles = [];
            let AreaEndCoords = [];
            if(MinLevel == null){
                MinLevel = Level;
            }
            if(state == null)
                state = 0;

            if(Level == MinLevel){
                SegmentsAngles = this.SaveSegmentsAngles(Level);
                
            }
            if(Level >= 0 && Level < this.Segments.length){
              
                for(let i = 0; i < 2 ; i++){
                    if((Level + i + state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                    else
                        this.Segments[Level].SetMinAngle();

                    
                    
                    if(this.Segments[Level].NextSegment != null){
                        AreaEndCoords = AreaEndCoords.concat(this.#GetWorkingAreaEndCoords(Level + 1,MinLevel,i)); 
                    }
                    else{
                        AreaEndCoords.push(this.Segments[Level].GetSegmentEndPositionGlobal());
                    }

                }
                if(Level != MinLevel)
                    return AreaEndCoords;
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                
            }
            return AreaEndCoords;
        }
        DrawAreaEnds(){
            let arr = this.#GetWorkingAreaEndCoords(0); 
            //console.log(arr);
            for(let i = 0; i < arr.length; i++){
                let Pt = new Point(arr[i][0],arr[i][1],10,String.fromCharCode(i + 65))
                Pt.Draw((320 / arr.length) * (i));
            }
        }
        SetPointsToMoveBetween(posx,posy){
            let res = this.CheckIfPointIsInSideWorkingArea(0,null,null,posx,posy);
            if(res % 2 == 1){
                this.Points.push(new Point(posx,posy,5,'X'));

                for(let i = 0; i < this.Points.length - 1; i++){
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.setLineDash([10,10]);
                ctx.moveTo(this.Points[i].posx,this.Points[i].posy);
                ctx.lineTo(this.Points[i + 1].posx,this.Points[i + 1].posy)
                ctx.stroke();
                ctx.closePath();
    
                this.Points[i].Draw();

                }
                if(this.Points.length > 0)
                    this.Points[this.Points.length - 1].Draw();  
            }
        }
        CheckIfPointIsInSideWorkingArea(Level,MinLevel,state,posx,posy){
            let Intersections = 0;
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
                if(this.Segments[Level].NextSegment != null){
                    for(let i = 0; i < 2 ; i++){
                        if((Level + i + state) % 2 == 0)
                            this.Segments[Level].SetMinAngle();
                        else
                            this.Segments[Level].SetMaxAngle();
                            
                        if(this.Segments[Level].NextSegment != null){
                            Intersections += this.CheckIfPointIsInSideWorkingArea(Level + 1,MinLevel,i,posx,posy); 
                        }
                        //Start from the left upper corner
                        let SegEndPos = this.Segments[Level].GetNextXSegmentPos();
                        let Origin = this.Segments[Level].GetOrigins();
                        let diffX = SegEndPos[0] - Origin[0];
                        let diffY = SegEndPos[1] - Origin[1];
                        let Rad = Math.sqrt(diffX**2 + diffY**2);
                        let Angle = Math.atan2(diffY, diffX) / Math.PI * 180;
                        
                        let StartAngle = (Angle + (this.Segments[Level].Angle - this.Segments[Level].Min_Angle));
                        let EndAngle = (Angle - this.Segments[Level].Max_Angle + this.Segments[Level].Angle);
    
                        //console.log(SegEndPos,Origin,diffX,diffY,Rad,Angle);
                        Intersections += this.CheckIfLineIntersectsArc([0,0],[posx,posy],Origin,Rad,StartAngle,EndAngle);
                    }
                }else{
                    if((Level +  state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                    else
                        this.Segments[Level].SetMinAngle();
                    //Start from the left upper corner
                    let SegEndPos = this.Segments[Level].GetNextXSegmentPos();
                    let Origin = this.Segments[Level].GetOrigins();
                    let diffX = SegEndPos[0] - Origin[0];
                    let diffY = SegEndPos[1] - Origin[1];
                    let Rad = Math.sqrt(diffX**2 + diffY**2);
                    let Angle = Math.atan2(diffY, diffX) / Math.PI * 180;
                    
                    let StartAngle = (Angle + (this.Segments[Level].Angle - this.Segments[Level].Min_Angle));
                    let EndAngle = (Angle - this.Segments[Level].Max_Angle + this.Segments[Level].Angle);

                    //console.log(SegEndPos,Origin,diffX,diffY,Rad,Angle);
                    Intersections += this.CheckIfLineIntersectsArc([0,0],[posx,posy],Origin,Rad,StartAngle,EndAngle);
                }
                
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                //console.log("Segment Angles Loaded")
                console.log(Intersections);
                if(Intersections % 2 == 0){
                    return false;
                }
                else
                    return true;
            }
            return Intersections;
        }
        CheckIfLineIntersectsArc(StartP,EndP,CircleC,Rad,StartAng,EndAng){
            
            let Intersections = 0;

            //(SEx² + SEy²) t² + 2 (SEx.CSx + SEy.CSy) t + CSx² + CSy² - R² = 0
            //discr = (2 (SEx.CSx + SEy.CSy))² - 4 * (SEx² + SEy²) * (CSx² + CSy² - R²)
            // t1,2 = (-(2 (SEx.CSx + SEy.CSy)) +- Sqrt(discr) ) / 2 * (SEx² + SEy²)


            //console.log(StartP,EndP,CircleC,Rad,StartAng,EndAng)
            let SE = [EndP[0] - StartP[0],EndP[1] - StartP[1]];
            let CS = [StartP[0] - CircleC[0],StartP[1] - CircleC[1]];
            let discr = (2 * (SE[0] * CS[0] + SE[1]*CS[1]))**2 - 4 * (SE[0]**2 + SE[1]**2) * (CS[0] ** 2 + CS[1] ** 2 - Rad ** 2);
            if(discr < 0){
                //If the discriminant is less than 0, it means there's no intersection between the line and the arc
                //That's an automatic 0 intersetion return
                //console.log(discr);
                return 0;
            }
            let t1 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) - Math.sqrt(discr)) / (2 * (SE[0]**2 + SE[1]**2));
            let t2 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) + Math.sqrt(discr)) / (2 * (SE[0]**2 + SE[1]**2));
            
            //To properly calculate with the angles
            //they need to be multiplied by -1

            StartAng *= (-1);
            EndAng *= (-1);

            //console.log(StartAng,EndAng);

            if(t1 > 0 && t1 < 1){
                let X1 = StartP[0] + t1 * SE[0];
                let Y1 = StartP[1] + t1 * SE[1];

                let Ang1 = Math.atan2(Y1 - CircleC[1], X1 - CircleC[0]);
                Ang1 = (Ang1  / Math.PI * 180 );

                Ang1 *= (-1);

                if(Ang1  > StartAng  && Ang1  < EndAng ){
                    Intersections += 1;
                }      
            }
            if(t2 > 0 && t2 < 1){

                let X2 = StartP[0] + t2 * SE[0];
                let Y2 = StartP[1] + t2 * SE[1];
        
                let Ang2 = Math.atan2(Y2 - CircleC[1], X2 - CircleC[0]);
                Ang2 = (Ang2  / Math.PI * 180 );

                Ang2 *= (-1) ;

                if(Ang2 > StartAng  && Ang2 < EndAng){
                    Intersections += 1;
                }  
            }
            return Intersections;
        }

    }