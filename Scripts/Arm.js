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
                let Pt = new Point(arr[i][0],arr[i][1],15,String.fromCharCode(i + 65))
                Pt.Draw((320 / arr.length) * (i));
            }
        }

        
    }