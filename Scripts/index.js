let canvas = document.querySelector('canvas');

    const Width = window.innerWidth;
    const Height = window.innerHeight;
    
    canvas.width = Width * 0.95;
    canvas.height = Height * 0.95;

    let ctx = canvas.getContext('2d');

    Origin_x = Width / 2 ;
    Origin_y = Height / 2 ;

    //Konstansok
    const First_Length = 1.2;
    const First_Min_Angle = 25;
    const First_Max_Angle = 90;
    const Second_Length = 0.9;
    const Second_Min_Angle = 45;
    const Second_Max_Angle = 135;

    let CS = new Coordinate_System(Width / 2,Height / 2,0);
    CS.DrawCS();
    
    let Segment1 = new Robot_Segment(CS,First_Length, First_Min_Angle, First_Min_Angle,First_Max_Angle);
    let Segment2 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    //let Segment3 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    
    Segment1.SetNextSegment(Segment2);
    Segment2.SetPrevSegment(Segment1);
    
    // Segment2.SetNextSegment(Segment3);
    // Segment3.SetPrevSegment(Segment2);

    Segment1.CS.DrawCS();
    Segment1.CS.DrawCSWithDivision(4);
    Segment1.Draw();
    
    Segment2.CS.DrawCS();
    Segment2.CS.DrawCSWithDivision(2);
    Segment2.Draw();

    // Segment3.CS.DrawCS();
    // Segment3.CS.DrawCSWithDivision(2);
    // Segment3.Draw();

    Arm = new Robot_Arm(CS);
    Arm.Segments[0] = Segment1;
    Arm.Segments[1] = Segment2;
    //Arm.Segments[2] = Segment3;
    Arm.DrawWorkingArea(0);
    Arm.DrawAreaEnds();

    Segment1.SetText("L3");
    Segment1.DrawText();

    Segment2.SetText("L4");
    Segment2.DrawText();

    canvas.addEventListener("wheel",e=>{
        if(e.deltaY < 0){
            
            for(let i = 0; i < Arm.Segments.length; i++){
                Arm.Segments[i].RotateAroundOrigin((Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
            }

            //console.log(Segment1.Angle)
        }
        else if(e.deltaY > 0){
            
            for(let i = 0; i < Arm.Segments.length; i++){
                Arm.Segments[i].RotateAroundOrigin(-(Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
            }
        }
        
        ClearScreen();

        Segment1.CS.DrawCS();
        Segment1.Draw();
        Segment1.CS.DrawCSWithDivision(4);
        
        Segment2.CS.DrawCS();
        Segment2.Draw();
        Segment2.CS.DrawCSWithDivision(2);
        
        // Segment3.CS.DrawCS();
        // Segment3.Draw();
        // Segment3.CS.DrawCSWithDivision(2);

        
        Segment1.SetText("L3");
        Segment1.DrawText();

        Segment2.SetText("L4");
        Segment2.DrawText();
        
        Arm.DrawWorkingArea(0);
        Arm.DrawAreaEnds();


    });
    canvas.addEventListener("mousedown",(e)=>{
        
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(0,0);
        ctx.lineTo(e.clientX,e.clientY);
        ctx.stroke();
        ctx.closePath();

        Arm.SetPointsToMoveBetween(e.clientX,e.clientY);
        
    });

    canvas.addEventListener("mousemove",(e)=>{
        let res = Arm.CheckIfPointIsInSideWorkingArea(0,null,null,e.clientX,e.clientY);
        if(res % 2 == 1){
            Arm.InverseKinematics(e.clientX,e.clientY);
            ClearScreen();

            Segment1.CS.DrawCS();
            Segment1.Draw();
            Segment1.CS.DrawCSWithDivision(4);
            
            Segment2.CS.DrawCS();
            Segment2.Draw();
            Segment2.CS.DrawCSWithDivision(2);
            Arm.DrawWorkingArea(0);
        }
    });

    





    


    


    



